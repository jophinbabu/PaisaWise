import { NextResponse } from "next/server";

import { isOnBoardingCompleted } from "@/actions/isOnboardingCompleted";
import { createSession } from "@/config/appwrite.config"
import { getUser } from "@/utils/getUser"

export const GET = async()=>{
    // check if user is authenticated
    let userData = null;
    try{
        userData = await getUser();
    }catch{
        return NextResponse.redirect("/auth/login");
    }
    // ensure if user onboarding is completed
    const isUserOnboardingCompleted = await isOnBoardingCompleted();

    if(!isUserOnboardingCompleted){
        return NextResponse.redirect("/onboarding");
    }

    // now you have user data

    const {avatar} = await createSession();

    const avatarBuffer = await avatar.getInitials(userData.name || "X");
    return new NextResponse(avatarBuffer, {
      headers: {
        "Content-Type": "image/jpeg", // Set the appropriate MIME type
        "Content-Length": avatarBuffer.byteLength.toString(),
      },
    });

}