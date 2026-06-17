import fastify from "fastify";
import {craeteNewDocument, getAllDocuments, getDocumentByID, getDocumentByKeyword, updateExistingDocument, deleteExistingDocument} from "../controller/document.controller.js";

export const documentRoutes = async (fastify)=>{
    // Router for creating new Document 
    fastify.post("/create", craeteNewDocument);

    // Router for updating existing Document
    fastify.put("/:id", updateExistingDocument);

    // Router for getting all Documents
    fastify.get("/all", getAllDocuments);

    // Router for getting Document by ID
    fastify.get("/:id", getDocumentByID);

    // Router for getting Document by keyword
    fastify.get("/", getDocumentByKeyword);

    // Router for deleting Document By ID
    fastify.delete("/:id", deleteExistingDocument);
}

