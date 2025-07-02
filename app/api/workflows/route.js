import { saveWorkflow, getWorkflows } from '../../lib/sheets';

export async function GET() {
  const workflows = await getWorkflows();
  return Response.json({ workflows });
}

export async function POST(request) {
  const body = await request.json();
  const result = await saveWorkflow(body);
  
  if (result.success) {
    return Response.json({ success: true, id: result.id });
  } else {
    return Response.json({ success: false, error: result.error }, { status: 500 });
  }
}
