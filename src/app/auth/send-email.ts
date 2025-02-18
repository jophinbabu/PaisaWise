"use server";
import emailValidator from 'email-validator';
import { ID } from 'node-appwrite';

import { createSession } from '@/config/appwrite.config';

export const sendEmail = async (email: string)=> {
try{
    if (!emailValidator.validate(email)) {
        throw new Error("Invalid email address");
    }
    
    // send email
    const {account} = await createSession();

    const emailToken = await account.createEmailToken(ID.unique(),email);


    return {
        success: true,
        message: "Email sent successfully",
        data: emailToken
    };


}
catch(e){
    if (e instanceof Error){
        return {
            success: false,
            message: e.message
        }

    }
    return {
        success: false,
        message: "Failed to send email"
    }
}

}