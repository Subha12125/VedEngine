import { createDocument, updateDocument, deleteDocument, findDocumentByID, getAllDocument, searchDocuments } from "../services/document.service.js";

//Creating New Document 
export const craeteNewDocument = async (request, reply) => {
    try {
        const newDocument = await createDocument(request.body);
        return reply.code(200).send({ status: "Success", data: newDocument, success: true });
    } catch (error) {
        console.log(error);
        return reply.code(500).send({ message: error.message, success: false });
    }
};

// Updating Existing Documents 
export const updateExistingDocument = async (request, reply) => {
    try {
        const updatedDoc = await updateDocument(request.params.id, request.body);
        return reply.code(200).send({ status: "Success", data: updatedDoc, success: true });
    } catch (error) {
        console.log(error);
        return reply.code(500).send({ message: error.message, success: false });
    }
};

// Get All Documents
export const getAllDocuments = async (request, reply) => {
    try {
        const documents = await getAllDocument();
        return reply.code(200).send({ status: "Success", data: documents, success: true });
    } catch (error) {
        console.log(error);
        return reply.code(500).send({ message: error.message, success: false });
    }
};

// GET document by ID
export const getDocumentByID = async (request, reply) => {
    try {
        const document = await findDocumentByID(request.params.id);
        return reply.code(200).send({ status: "Success", data: document, success: true });
    } catch (error) {
        console.log(error);
        return reply.code(500).send({ message: error.message, success: false });
    }
};

// GET Document By keyword
export const getDocumentByKeyword = async (request, reply) => {
    try {
        const documents = await searchDocuments(request.query.keyword);
        return reply.code(200).send({ status: "Success", data: documents, success: true });
    } catch (error) {
        console.log(error);
        return reply.code(500).send({ message: error.message, success: false });
    }
};

// Delete Document By ID
export const deleteExistingDocument = async (request, reply) => {
    try {
        const deletedDocument = await deleteDocument(request.params.id);
        return reply.code(200).send({ status: "Success", data: deletedDocument, success: true });
    } catch (error) {
        console.log(error);
        return reply.code(500).send({ message: error.message, success: false });
    }
};