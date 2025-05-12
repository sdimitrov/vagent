import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/db';
import { socialConnections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: connectionId } = await params;
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }

    const db = await getDb();

    // Perform the delete operation
    const result = await db
      .delete(socialConnections)
      .where(and(eq(socialConnections.id, connectionId), eq(socialConnections.userId, userId)))
      .returning(); // Optional: returning() to get the deleted record(s)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Connection not found or user unauthorized to delete this connection' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Connection deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
  }
} 