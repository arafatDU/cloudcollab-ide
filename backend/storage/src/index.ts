import { ExecutionContext, R2Bucket, Headers as CFHeaders } from "@cloudflare/workers-types"

// Default code for cloudfare workers

export default {
	async fetch(
		request: Request,
		ctx: ExecutionContext
	): Promise<Response> {
		const response = await fetch(request)
		return response
	}
}
