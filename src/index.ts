const corsHeaders = {
	"Access-Control-Allow-Origin":  "*",
	"Access-Control-Allow-Headers": "*",
	"Access-Control-Allow-Methods": "*",
}

const send = (data: string | Record<string, string>, init?: ResponseInit) => {
	const isJSON = data && typeof data === "object"
	return new Response(isJSON ? JSON.stringify(data) : data, {
		...init,
		headers: {
			...init?.headers,
			...corsHeaders,
			"content-type": isJSON ? "application/json" : "text/plain",
		},
	})
}

const handler: ExportedHandler<{ BUCKET: R2Bucket; ENCRYPT_SECRET: string }> = {
	async fetch(request, env, event): Promise<Response> {
		const url = new URL(request.url)
		const object_key = url.pathname.substring(1)

		try {
			// Files are publicly accessible
			if (request.method === "GET") {
				if (url.pathname === "/") {
					return send("hello world")
				}

				const cache = caches.default
				const cachedResponse = await cache.match(request)

				if (cachedResponse) {
					console.log("cached!")
					return cachedResponse
				}

				const object = await env.BUCKET.get(object_key)
				if (!object) {
					return send("object not found", { status: 404 })
				}
				const response = new Response(object.body, {
					headers: {
						"Cache-Control": "public, max-age=31536000, immutable",
					},
				})
				event.waitUntil(cache.put(request, response.clone()))
				return response
			}

			if (request.method === "OPTIONS") {
				return send("")
			}

			if (request.method === "POST") {
				const token = request.headers
					.get("authorization")
					?.replace("Bearer ", "")
					.trim()

				if (!token) {
					throw new Error("missing auth token")
				}

				if (env.ENCRYPT_SECRET != token) {
					console.error({ received_token: token })
					return send("invalid token", {
						status: 401,
					})
				}

				const form_data = await request.formData()
				const file = form_data.get("file") as File

				if (!file || !(file instanceof File)) {
					throw new Error("missing file or invalid file")
				}

				const meta_json = form_data.get("meta") as string
				const meta = JSON.parse(meta_json)

				await env.BUCKET.put(object_key, await file.arrayBuffer(), {
					httpMetadata: {
						contentType: file.type,
						// contentEncoding: "gzip",
						// contentLanguage: "en",
						// contentDisposition: "inline",
						// cacheControl: "public, max-age=31536000, immutable",
						// cacheExpiry: new Date(Date.now() + 10),
					},
					customMetadata: {
						// Store the original filename
						filename: file.name,
						...meta,
					},
				})

				console.log("uploaded", file.type, object_key)
				return send("OK")
			}
		} catch (error: any) {
			console.error({ error })
			return send(error.message, { status: 500 })
		}

		return send("Hello World!")
	},
}

export default handler
