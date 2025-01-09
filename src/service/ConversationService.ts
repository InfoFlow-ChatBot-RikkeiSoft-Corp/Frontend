import Dexie from 'dexie';
import { EventEmitter } from "./EventEmitter";
import { ChatMessage } from '../models/ChatCompletion';

export interface Conversation {
  id: number;
  gid: number;
  timestamp: number;
  title: string;
  model: string | null,
  systemPrompt: string,
  messages: string; // stringified ChatMessage[]
  marker?: boolean;
}

export interface ConversationChangeEvent {
  action: 'add' | 'edit' | 'delete',
  id: number,
  conversation?: Conversation, // not set on delete
}

class ConversationDB extends Dexie {
  conversations: Dexie.Table<Conversation, number>;

  constructor() {
    super("conversationsDB");
    this.version(1).stores({
      conversations: '&id, gid, timestamp, title, model'
    });
    this.conversations = this.table("conversations");
  }
}

const db = new ConversationDB();
const NUM_INITIAL_CONVERSATIONS = 200;

class ConversationService {

  static async getConversationById(id: number): Promise<Conversation | undefined> {
    return db.conversations.get(id);
  }

  static async getChatMessages(conversation: Conversation): Promise<ChatMessage[]> {
    return JSON.parse(conversation.messages);
  }

  static async searchConversationsByTitle(searchString: string): Promise<Conversation[]> {
    searchString = searchString.toLowerCase();
    return db.conversations
      .filter(conversation => conversation.title.toLowerCase().includes(searchString))
      .toArray();
  }

  // todo: Currently we are not indexing messages since it is expensive
  static async searchWithinConversations(searchString: string): Promise<Conversation[]> {
    return db.conversations
        .filter(conversation => conversation.messages.includes(searchString))
        .toArray();
  }

  // This is adding a new conversation object with empty messages "[]"
  static async addConversation(conversation: Conversation): Promise<void> {
    await db.conversations.add(conversation);
    let event: ConversationChangeEvent = {action: 'add', id: conversation.id, conversation: conversation};
    conversationsEmitter.emit('conversationChangeEvent', event);
  }

  static deepCopyChatMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(msg => ({
      ...msg,
    }));
  }

  static async updateConversation(conversation: Conversation, messages: ChatMessage[]): Promise<void> {
    const messagesCopy = ConversationService.deepCopyChatMessages(messages);

    conversation.messages = JSON.stringify(messagesCopy);
    await db.conversations.put(conversation);
    let event: ConversationChangeEvent = {action: 'edit', id: conversation.id, conversation: conversation};
    conversationsEmitter.emit('conversationChangeEvent', event);
  }

  static async updateConversationPartial(conversation: Conversation, changes: any): Promise<number> {
    // todo: currently not emitting event for this case
    return db.conversations
        .update(conversation.id, changes)
  }

  static async deleteConversation(id: number): Promise<void> {
    const conversation = await db.conversations.get(id);
    if (conversation) {
      await db.conversations.delete(id);
      let event: ConversationChangeEvent = {action: 'delete', id: id};
      conversationsEmitter.emit('conversationChangeEvent', event);
    } else {
      console.log(`Conversation with ID ${id} not found.`);
    }
  }

  static async deleteAllConversations(): Promise<void> {
    await db.conversations.clear();
    let event: ConversationChangeEvent = {action: 'delete', id: 0};
    conversationsEmitter.emit('conversationChangeEvent', event);
  }

  static async loadRecentConversationsTitleOnly(): Promise<Conversation[]> {
    try {
      const conversations = await db.conversations
        .orderBy('timestamp')
        .reverse()
        .limit(NUM_INITIAL_CONVERSATIONS)
        .toArray(conversations => conversations.map(conversation => {
          const conversationWithEmptyMessages = {...conversation, messages: "[]"};
          return conversationWithEmptyMessages;
        }));
      return conversations;
    } catch (error) {
      console.error("Error loading recent conversations:", error);
      throw error;
    }
  }

  static async countConversationsByGid(id: number): Promise<number> {
    return db.conversations
        .where('gid').equals(id)
        .count();
  }

  static async deleteConversationsByGid(gid: number): Promise<void> {
    const conversationsToDelete = await db.conversations
      .where('gid').equals(gid).toArray();
    for (const conversation of conversationsToDelete) {
      await ConversationService.deleteConversation(conversation.id);
    }
    let event: ConversationChangeEvent = {action: 'delete', id: 0};
    conversationsEmitter.emit('conversationChangeEvent', event);
  }

}

export const conversationsEmitter = new EventEmitter<ConversationChangeEvent>();
export default ConversationService;