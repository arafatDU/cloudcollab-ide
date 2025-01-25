export default {
  async fetch(request : Request, ctx: ExecutionContext): Promise<Response> {
    return new Response("Hello World")
  },
};