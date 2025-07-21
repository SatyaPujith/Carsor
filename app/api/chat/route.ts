import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId, UpdateFilter } from 'mongodb';
import { generateGeminiResponse } from '@/lib/gemini-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Conversation {
  userId: ObjectId;
  conversationId: string;
  messages: Message[];
  lastUpdated: Date;
  createdAt?: Date;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    const conversations = db.collection<Conversation>('conversations');
    
    // Get user profile
    const user = await db.collection('users').findOne(
      { _id: new ObjectId((session.user as any).id) }
    );

    // Get user issues
    const userIssues = await db.collection('issues')
      .find({ userId: new ObjectId((session.user as any).id) })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const vehicleContext = user?.vehicleModel 
      ? `User owns a ${user.vehicleModel} (${user.vehicleYear || 'Unknown year'})` 
      : 'User is a Carsor Motors vehicle owner';

    // Generate AI response
    const aiResponse = await generateGeminiResponse(message, vehicleContext, userIssues);

    const currentConvId = conversationId || new ObjectId().toString();

    const newMessages: Message[] = [
      {
        id: new ObjectId().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      },
      {
        id: new ObjectId().toString(),
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      }
    ];

    const updateDoc: UpdateFilter<Conversation> = {
      $push: {
        messages: { $each: newMessages }
      },
      $set: {
        lastUpdated: new Date()
      },
      $setOnInsert: {
        userId: new ObjectId((session.user as any).id),
        conversationId: currentConvId,
        createdAt: new Date()
      }
    };

    await conversations.updateOne(
      {
        userId: new ObjectId((session.user as any).id),
        conversationId: currentConvId
      },
      updateDoc,
      { upsert: true }
    );

    return NextResponse.json({
      response: aiResponse,
      conversationId: currentConvId
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      response: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    const conversations = db.collection<Conversation>('conversations');

    if (conversationId) {
      const conversation = await conversations.findOne({
        userId: new ObjectId((session.user as any).id),
        conversationId
      });

      return NextResponse.json(conversation?.messages || []);
    } else {
      const allConversations = await conversations
        .find({ userId: new ObjectId((session.user as any).id) })
        .sort({ lastUpdated: -1 })
        .toArray();

      return NextResponse.json(allConversations);
    }

  } catch (error) {
    console.error('Chat history fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
