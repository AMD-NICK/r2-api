const checkAuthorization = (request: Request, env: { ENCRYPT_SECRET: string }): boolean => {
	if (request.method === "GET") return true;

	const token = request.headers.get("authorization")?.replace("Bearer ", "")?.trim();
	return token === env.ENCRYPT_SECRET;
};

const handler: ExportedHandler<{ BUCKET: R2Bucket; ENCRYPT_SECRET: string }> = {
	async fetch(request, env, event): Promise<Response> {
		const url = new URL(request.url)
		const key = url.pathname.slice(1);

		if (!checkAuthorization(request, env))
			return new Response("Forbidden", { status: 403 });

		switch (request.method) {
			case "GET": // Files are publicly accessible
				const object = await env.BUCKET.get(key)
				if (!object)
					return new Response("Object not found. Telegram bot: t.me/cfr2bot", { status: 404 })

				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);

				return new Response(object.body, {headers})

			case "PUT":
			case "POST":
				const form_data = await request.formData()
				const file = form_data.get("file") as File

				if (!file || !(file instanceof File))
					throw new Error("missing file or invalid file")

				const meta_json = form_data.get("meta") as string
				const meta = JSON.parse(meta_json)

				await env.BUCKET.put(key, await file.arrayBuffer(), {
					httpMetadata: {
						contentType: file.type,
					},
					customMetadata: {
						filename: file.name,
						...meta,
					},
				})

				console.log("uploaded type: " + file.type, "key: " + key, "size: " + file.size);
				return new Response("OK")
			case "DELETE":
				await env.BUCKET.delete(key)
				return new Response("OK")
			default:
				return new Response("Method Not Allowed", {
					status: 405,
					headers: {
						Allow: 'PUT, GET, DELETE',
					},
				})
		}
	},
}

export default handler
