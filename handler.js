const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  if (name === undefined) {
    // Client tidak melampirkan properti name pada request body
    const response = h
      .response({
        status: "fail",
        message: "Gagal menambahkan buku. Mohon isi nama buku",
      })
      .code(400);
    return response;
  }

  if (readPage > pageCount) {
    // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
    const response = h
      .response({
        status: "fail",
        message:
          "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
      })
      .code(400);
    return response;
  }
  const newBook = {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    id,
    finished,
    insertedAt,
    updatedAt,
  };
  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    // respons saat buku berhasil dimasukan
    const response = h
      .response({
        status: "success",
        message: "Buku berhasil ditambahkan",
        data: {
          bookId: id,
        },
      })
      .code(201);
    return response;
  }
  // respons saat buku gagal dimasukan
  const response = h
    .response({
      status: "fail",
      message: "Buku gagal ditambahkan",
    })
    .code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  if (name) {
    const filteredBooksName = books.filter((book) => {
      // bila ada query name
      const nameReg = new RegExp(name, "gi");
      return nameReg.test(book.name);
    });

    const response = h
      .response({
        status: "success",
        data: {
          books: filteredBooksName.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      })
      .code(200);

    return response;
  }

  if (reading) {
    // bila ada query reading
    const filteredBooksReading = books.filter(
      (book) => Number(book.reading) === Number(reading)
    );

    const response = h
      .response({
        status: "success",
        data: {
          books: filteredBooksReading.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      })
      .code(200);

    return response;
  }

  // bila ada query finished
  if (finished) {
    const filteredBooksFinished = books.filter(
      (book) => Number(book.finished) === Number(finished)
    );

    const response = h
      .response({
        status: "success",
        data: {
          books: filteredBooksFinished.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      })
      .code(200);

    return response;
  }
   // bila tidak ada query
   if (!name && !reading && !finished) {
    const response = h
      .response({
        status: "success",
        data: {
          books: books.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      })
      .code(200);

    return response;
  }
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((n) => n.id === bookId)[0]; // find book by id

  if (book) {
    // Bila buku dengan id yang dilampirkan ditemukan
    const response = h
      .response({
        status: "success",
        data: {
          book,
        },
      })
      .code(200);
    return response;
  }

  // Bila buku dengan id yang dilampirkan oleh client tidak ditemukan
  const response = h
    .response({
      status: "fail",
      message: "Buku tidak ditemukan",
    })
    .code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const finished = pageCount === readPage;
  const updatedAt = new Date().toISOString();

  if (!name) {
    // Client tidak melampirkan properti name pada request body
    const response = h
      .response({
        status: "fail",
        message: "Gagal memperbarui buku. Mohon isi nama buku",
      })
      .code(400);
    return response;
  }

  if (readPage > pageCount) {
    // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
    const response = h
      .response({
        status: "fail",
        message:
          "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
      })
      .code(400);
    return response;
  }

  const index = books.findIndex((bookFind) => bookFind.id === bookId); // find book by id

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt,
    };

    // Bila buku berhasil diperbarui
    const response = h
      .response({
        status: "success",
        message: "Buku berhasil diperbarui",
      })
      .code(200);
    return response;
  }

  // id yang dilampirkan oleh client tidak ditemukkan oleh server
  const response = h
    .response({
      status: "fail",
      message: "Gagal memperbarui buku. Id tidak ditemukan",
    })
    .code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((bookFind) => bookFind.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    // respons saat id sesuai
    const response = h
      .response({
        status: "success",
        message: "Buku berhasil dihapus",
      })
      .code(200);
    return response;
  }
  // saat id yang dimasukan tidak dimiliki oleh buku manapun
  const response = h
    .response({
      status: "fail",
      message: "Buku gagal dihapus. Id tidak ditemukan",
    })
    .code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
