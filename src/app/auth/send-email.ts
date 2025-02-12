"use server";
import emailValidator from 'email-validator';
import { ID } from 'node-appwrite';

import { createSession } from '@/config/appwrite.config';

export const sendEmail = async (email: string)=> {
    if (!emailValidator.validate(email)) {
        throw new Error("Invalid email address");
    }
    
    // send email
    const {account} = await createSession();

    const emailToken = await account.createEmailToken(ID.unique(),email);


    return emailToken;




}