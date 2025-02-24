import React from 'react';

import { isActiveMember, isOwner } from "../../(actions)/isActivemember";
import { getCompanyData } from './(actions)/CompanyData';
import CompanyProfilePage from './CompanyProfile';

async function Page() {
    const companydata = await getCompanyData();
    const ownerStatus = await isOwner();
    const employeeStatus = await isActiveMember();

    return (
        <>
            <CompanyProfilePage  
                company={{
                    ...companydata,
                    name: companydata.companyName
                }}
                ownerStatus={ownerStatus}
                employeeStatus={employeeStatus}
            />
        </>
    );
}

export default Page;
