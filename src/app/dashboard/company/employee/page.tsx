import React from 'react'

import { getOrgs } from '../../(actions)/getOrgs';
import { currentEmployees } from './(actions)/current-employees';
import { requestEmployees } from './(actions)/request-employees';
import { EmployeesPage } from './Employee';

async function Page() {
  const org = await getOrgs();
  const employees = await currentEmployees();
  const request = await requestEmployees();
  return (
    <EmployeesPage orgCode={org.$id} employees={employees} requestsEmp={request} />
  )
}

export default Page