import { NextResponse } from 'next/server';
import { executeDataOperation } from '@/lib/dataOperations';

export async function POST(request) {
  try {
    const { table, operation, args } = await request.json();
    if (!table || !operation) {
      return NextResponse.json({ error: 'table and operation are required' }, { status: 400 });
    }
    const result = await executeDataOperation({ table, operation, args: args || {} });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
