import { FastifyRequest } from "fastify";
import { identityRequestBodyType } from "../Schemas/identityReconciliationSchema";
import { createPrimaryIdentity, createSecondaryIdentity, getAllIdentity, getIdentity, getIdentityById, markIdentitySecondary } from "../Services/identityReconciliationService";
import { prisma } from "../../database";
import { $Enums, Prisma } from "@prisma/client";

type identity = {
    id: number;
    phoneNumber: string | null;
    email: string | null;
    linkedId: number | null;
    linkPrecedence: $Enums.linkPrecedence | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

type identityResp = identity & {
    secondaryIdentity: identity[],
    primaryIdentity: identity | null   
}

export async function identityReconciliationHandler(request: FastifyRequest<{
    Body: identityRequestBodyType;
}>) {
    const body = request.body;
    return await prisma.$transaction(async trx => {
        const identities = await getIdentity(trx, body);
        console.log(identities.length)
        if (identities.length === 0) {
            const data: identityResp = await createPrimaryIdentity(trx, body)
            return responseHandler(trx, data);
        }

        const mails: {
            [key: string]: identity[];
        } = {};
        const phoneNumbers: {
            [key: string]: identity[];
        } = {};
        let res;
        await Promise.all(identities.map(idt => {
            if ((idt.email === body.email && idt.phoneNumber === body.phoneNumber) ||
                    (idt.email === body.email && !body.phoneNumber) ||
                        (idt.phoneNumber === body.phoneNumber && !body.email)) {
                res = responseHandler(trx, idt)
            }
            if (idt.email && idt.email === body.email) {
                if (!mails[idt.email]) {
                    mails[idt.email] = []; 
                }
                mails[idt.email].push(idt);
            } else if (idt.phoneNumber && idt.phoneNumber === body.phoneNumber) {
                if (!phoneNumbers[idt.phoneNumber]) {
                    phoneNumbers[idt.phoneNumber] = [];
                }
                phoneNumbers[idt.phoneNumber].push(idt)
            }
        }));
        if (res) {
            return res;
        }
        if (body.email && body.phoneNumber && !mails[body.email]) {
            const primaryId = phoneNumbers[body.phoneNumber].find(idt => idt.linkPrecedence === "primary");
            if (primaryId) {
                const data = await createSecondaryIdentity(trx, body, primaryId?.id)
                return responseHandler(trx, data);
            }
            const secondayId = phoneNumbers[body.phoneNumber].find(idt => idt.linkPrecedence === "secondary");
            if (secondayId && secondayId.linkedId) {
                const data = await createSecondaryIdentity(trx, body, secondayId.linkedId);
                return responseHandler(trx, data);
            }
        } else if (body.email && body.phoneNumber && !phoneNumbers[body.phoneNumber]) {
            const primaryId = mails[body.email].find(idt => idt.linkPrecedence === "primary");
            if (primaryId) {
                const data = await createSecondaryIdentity(trx, body, primaryId?.id)
                return responseHandler(trx, data); 
            } 
            const secondayId = mails[body.email].find(idt => idt.linkPrecedence === "secondary");
            if (secondayId && secondayId.linkedId) {
                const data = await createSecondaryIdentity(trx, body, secondayId.linkedId);
                return responseHandler(trx, data);
            }                          
        } else {
            if (body.email && body.phoneNumber) {
                const primaryId = mails[body.email].find(idt => idt.linkPrecedence === "primary");
                if (primaryId) {
                    const id = phoneNumbers[body.phoneNumber].find(idt => idt.linkPrecedence === "primary")?.id
                    if (id) {
                        const data = await markIdentitySecondary(trx, id, primaryId.id);
                        return responseHandler(trx, data);
                    }
                }
            }
        }
    },
    { timeout: 900_000, maxWait: 15_000 }).finally(async () => {
        await prisma.$disconnect();
    })
}

async function responseHandler(trx: Prisma.TransactionClient, data: identityResp) {
    if (data.linkPrecedence === "primary") {
        const response = getResponse(data)
        return response;
    } else if (data.linkedId) {
        const primary = await getIdentityById(trx, data.linkedId);
        if (primary) {
            const response = getResponse(primary);
            return response;            
        }
    }
}

async function getResponse(data: identityResp) {
    const emails = data.email ? [data.email] : []
    const phoneNumbers = data.phoneNumber ? [data.phoneNumber] : []
    const secondaryIds: number[] = []
    data.secondaryIdentity.map(idt => {
        !emails.includes(idt.email) && emails.push(idt.email)
        !phoneNumbers.includes(idt.phoneNumber) && phoneNumbers.push(idt.phoneNumber)
        !secondaryIds.includes(idt.id) && secondaryIds.push(idt.id)        
    })
    const response = {
        "contact": {
            "primaryContatctId": data.id,
            "emails": emails,
            "phoneNumbers": phoneNumbers,
            "secondaryContactIds": secondaryIds
        }
    }
    return response;
}

export async function getIdentityReconciliationHandler() {
    const data = await getAllIdentity();
    return data;
}