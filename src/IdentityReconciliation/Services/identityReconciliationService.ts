import { Prisma } from "@prisma/client";
import { identityRequestBodyType } from "../Schemas/identityReconciliationSchema";
import { prisma } from "../../database";

export async function getIdentity(trx: Prisma.TransactionClient, req: identityRequestBodyType) {
    const data = await trx.identity.findMany({
        where:{
            OR: [
                {
                    email: req.email
                },
                {
                    phoneNumber: req.phoneNumber
                }
            ],
        }, 
        include: {
            secondaryIdentity: true,
            primaryIdentity: true
        }
    });
    return data;
}

export async function createPrimaryIdentity(trx: Prisma.TransactionClient, req: identityRequestBodyType) {
    const date = new Date();
    const data = await trx.identity.create({
        data:{
            ...req,
            linkPrecedence: "primary",
            createdAt: date,
            updatedAt: date,
        }, 
        include: {
            secondaryIdentity: true,
            primaryIdentity: true
        }
    });
    return data;
}

export async function createSecondaryIdentity(trx: Prisma.TransactionClient, req: identityRequestBodyType, linkedId: number) {
    const date = new Date();
    const data = await trx.identity.create({
        data:{
            ...req,
            linkPrecedence: "secondary",
            createdAt: date,
            updatedAt: date,
            linkedId
        }, 
        include: {
            secondaryIdentity: true,
            primaryIdentity: true
        }
    });
    return data;
}

export async function markIdentitySecondary(trx: Prisma.TransactionClient, id: number, linkedId: number) {
    const date = new Date();
    const data = await trx.identity.update({
        where: {
            id,
            linkPrecedence: "primary"
        }, 
        data: {
            linkPrecedence: "secondary",
            linkedId,
            updatedAt: date 
        }, 
        include: {
            secondaryIdentity: true,
            primaryIdentity: true
        }
    })
    return data;
}

export async function getIdentityById(trx: Prisma.TransactionClient, id: number) {
    const data = await trx.identity.findUnique({
        where:{
            id
        }, 
        include: {
            secondaryIdentity: true,
            primaryIdentity: true
        }
    });
    return data;
}

export async function getAllIdentity() {
    const data = await prisma.identity.findMany();
    return data;
}