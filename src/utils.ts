import fetch from "node-fetch";
import type { Response } from "node-fetch";
import type { ErrorResponse } from "./interfaces.js";

export const formatAddress = (address: string): string => {
	if (!address.startsWith("http://") && !address.startsWith("https://")) {
		address = `http://${address}`;
	}

	while (address.endsWith("/")) {
		address = address.substring(0, address.length - 1);
	}

	return address;
};

const checkOk = async (response: Response): Promise<void> => {
	if (!response.ok) {
		let message = await response.text();

		try {
			message = (JSON.parse(message) as ErrorResponse).error;
		} catch(error) {
			// Do nothing.
		}

		throw new Error(message);
	}
};

export const get = async (address: string): Promise<Response> => {
	const response = await fetch(formatAddress(address));

	await checkOk(response);

	return response;
};

export const post = async (address: string, data?: Record<string, unknown>): Promise<Response> => {
	const response = await fetch(formatAddress(address), {
		method: "POST",
		body: JSON.stringify(data)
	});

	await checkOk(response);

	return response;
};

export const del = async (address: string, data?: Record<string, unknown>): Promise<Response> => {
	const response = await fetch(formatAddress(address), {
		method: "DELETE",
		body: JSON.stringify(data)
	});

	await checkOk(response);

	return response;
};

export const parseJSON = async function * <T = unknown>(itr: Iterable<{ toString: () => string }> | AsyncIterable<{ toString: () => string }>): AsyncGenerator<T> {
	let buffer = "";

	for await (const chunk of itr) {
		buffer += chunk;

		const parts = buffer.split("\n");

		buffer = parts.pop() ?? "";

		for (const part of parts) {
			try {
				yield JSON.parse(part);
			} catch (error) {
				console.warn("invalid json: ", part);
			}
		}
	}

	for (const part of buffer.split("\n").filter(p => p !== "")) {
		try {
			yield JSON.parse(part);
		} catch (error) {
			console.warn("invalid json: ", part);
		}
	}
};
