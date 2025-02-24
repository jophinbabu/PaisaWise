"use server";

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";


export const Cookies = async ()=>{
    return await cookies();
}

export const setCookie = async (name: string, value: string, options: Partial<ResponseCookie>)=>{
    const cookieStore = await cookies();
    await cookieStore.set(name, value, options);
    return value;
}

export const getCookie = async (name: string)=>{
    const cookieStore = await cookies();
    const token = await cookieStore.get(name)?.value;
    return token;
}

export const removeCookie = async (name: string)=>{
    const cookieStore = await cookies();
    await cookieStore.delete(name);

    return true;
}