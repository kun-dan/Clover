export function ok<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

export function created<T>(data: T) {
  return Response.json(data, { status: 201 });
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return Response.json({ error: message }, { status: 404 });
}

export function conflict(message: string) {
  return Response.json({ error: message }, { status: 409 });
}

export function serverError(message = "Internal server error") {
  return Response.json({ error: message }, { status: 500 });
}
