import React from 'react'

import { getCompanyData } from './(actions)/CompanyData'
import CompanyProfilePage from './CompanyProfile'

async function Page() {
    const companydata =await getCompanyData();
  return (
    <>
    <CompanyProfilePage  company={{
        ...companydata,
        name:companydata.companyName
    }}/>
    </>
  )
}

export default Page