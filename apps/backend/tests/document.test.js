import { describe, it, expect, beforeAll } from "vitest";
import buildApp from "../src/app.js";

describe("Document API Tests — /api/v1 and /api/v1/documents", () => {
    let app;
    let createdDocId = "";

    beforeAll(async () => {
        app = await buildApp();
        await app.ready();
    }, 30000);

    it("should retrieve all documents from /api/v1/all", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/all",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
    });

    it("should retrieve all documents from /api/v1/documents/all", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/documents/all",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
    });

    it("should create a new document via POST /api/v1/create", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/create",
            payload: {
                title: "Test Verification Document",
                content: "This is automated test content verifying the document persistence lifecycle in VedEngine.",
                description: "Automated test description",
            },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.id).toBeDefined();
        createdDocId = body.data.id;
    });

    it("should fetch a document by ID via GET /api/v1/documents/:id", async () => {
        expect(createdDocId).toBeTruthy();

        const response = await app.inject({
            method: "GET",
            url: `/api/v1/documents/${createdDocId}`,
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.id).toBe(createdDocId);
        expect(body.data.title).toBe("Test Verification Document");
    });

    it("should update an existing document via PUT /api/v1/:id", async () => {
        expect(createdDocId).toBeTruthy();

        const response = await app.inject({
            method: "PUT",
            url: `/api/v1/${createdDocId}`,
            payload: {
                title: "Updated Verification Document Title",
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.title).toBe("Updated Verification Document Title");
    });

    it("should delete a document via DELETE /api/v1/:id", async () => {
        expect(createdDocId).toBeTruthy();

        const response = await app.inject({
            method: "DELETE",
            url: `/api/v1/${createdDocId}`,
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
    });
});
