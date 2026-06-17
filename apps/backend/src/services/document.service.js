import prisma from "../config/prisma.config.js";

//create Document
export const createDocument = async (data) => {
    try {
        const document = await prisma.document.create({ data });
        return document;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// GET all Documents 
export const getAllDocument = async () => {
    try {
        const documents = await prisma.document.findMany({ orderBy: { createdAt: 'desc' } });
        return documents;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Find By ID
export const findDocumentByID = async (id) => {
    try {
        const document = await prisma.document.findUnique({ where: { id } });
        return document;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Update Document 
export const updateDocument = async (id, data) => {
    try {
        const updatedDocument = await prisma.document.update({ where: { id }, data });
        return updatedDocument;
    } catch (error) {
        throw error;
    }
};

// Delete Document
export const deleteDocument = async (id) => {
    try {
        const deletedDocument = await prisma.document.delete({ where: { id } });
        return deletedDocument;
    } catch (error) {
        throw error;
    }
};

// find by keywords
export const searchDocuments = async (keyword) => {
    try {
        const results = await prisma.document.findMany({
            where: {
                OR: [
                    { title: { contains: keyword } },
                    { content: { contains: keyword } }
                ]
            }
        });
        return results;
    } catch (error) {
        throw error;
    }
};