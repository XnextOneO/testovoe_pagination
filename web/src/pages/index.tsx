import Head from "next/head";
import {Inter} from "next/font/google";
import Table from "react-bootstrap/Table";
import {Alert, Container, Pagination} from "react-bootstrap";
import {GetServerSideProps, GetServerSidePropsContext} from "next";
import {useState} from "react";
import {useRouter} from "next/router";

const inter = Inter({subsets: ["latin"]});

type TUserItem = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  updatedAt: string
}

type TGetServerSideProps = {
  statusCode: number
  users: TUserItem[]
  total: number
}


export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  const page = ctx.query.page ? Number(ctx.query.page) : 1;
  const limit = 20;

  try {
    const res = await fetch(`http://localhost:3000/users?page=${page}&limit=${limit}`, {method: 'GET'})
    if (!res.ok) {
      return {props: {statusCode: res.status, users: [], total: 0}}
    }

    const data = await res.json();
    return {
      props: {statusCode: 200, users: data.users, total: data.total}
    }
  } catch (e) {
    return {props: {statusCode: 500, users: [], total: 0}}
  }
}) satisfies GetServerSideProps<TGetServerSideProps>


export default function Home({statusCode, users, total}: TGetServerSideProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [userList, setUserList] = useState(users);
  const limit = 20;
  const router = useRouter();


  const pagesToShow = 10;
  const pagesOffset = Math.floor(pagesToShow / 2);

  let startPage = currentPage - pagesOffset;
  let endPage = startPage + pagesToShow - 1;

  if (startPage < 1) {
    endPage -= startPage - 1;
    startPage = 1;
  }

  if (endPage > Math.ceil(total / limit)) {
    startPage -= endPage - Math.ceil(total / limit);
    endPage = Math.ceil(total / limit);
  }

  if (startPage < 1) {
    startPage = 1;
  }

  const pages = Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);


  const handlePageChange = async (pageNumber: number) => {
    setCurrentPage(pageNumber);
    try {
      const res = await fetch(`http://localhost:3000/users?page=${pageNumber}&limit=${limit}`, {method: 'GET'})
      if (!res.ok) {
        console.error('Server response was not ok', res);
      } else {
        const data = await res.json();
        setUserList(data.users);
      }
    } catch (error) {
      console.error('Fetch failed---------------------------', error);
    }
    router.push(`/?page=${pageNumber}&limit=${limit}`);
  };


  if (statusCode !== 200) {
    return <Alert variant={'danger'}>Ошибка {statusCode} при загрузке данных</Alert>
  }

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={'mb-5'}>Пользователи</h1>
          <Table striped bordered hover>
            <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Дата обновления</th>
            </tr>
            </thead>
            <tbody>
            {
              userList.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))
            }
            </tbody>
          </Table>
          <Pagination>
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1}/>
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}/>
            {pages.map(page => (
              <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage * limit >= total}/>
            <Pagination.Last onClick={() => handlePageChange(total/limit)} disabled={currentPage * limit >= total}/>
          </Pagination>
        </Container>
      </main>
    </>
  );
}
