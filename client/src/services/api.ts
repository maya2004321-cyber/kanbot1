const API_URL = import.meta.env.VITE_API_URL;
export async function apiRequest<T>(
endpoint: string,
options: RequestInit = {}
): Promise<T> {
const token = localStorage.getItem('kanbot_token');
const headers: HeadersInit = {
'Content-Type': 'application/json',
...options.headers,
};
if (token) {
Object.assign(headers, {
Authorization: 'Bearer ' + token,
});
}
const response = await fetch(API_URL + endpoint, {
...options,
headers,
});
const responseText = await response.text();
const data = responseText ? JSON.parse(responseText) : null;
if (!response.ok) {
throw new Error(
data?.error?.message || 'Something went wrong'
);
}
return data as T;
}