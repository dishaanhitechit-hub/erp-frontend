export default function PrintErrorPage({ status, message }) {
  const is404 = status === 404;
  const is500 = status === 500;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-[72px] font-bold text-gray-200 leading-none mb-2">
          {status || "!"}
        </div>
        <h1 className="text-[18px] font-semibold text-gray-700 mb-2">
          {is404
            ? "Document Not Found"
            : is500
            ? "Server Error"
            : "Unable to Load Document"}
        </h1>
        <p className="text-[13px] text-gray-500">
          {message ||
            (is404
              ? "No document exists for this link. The UUID may be invalid or expired."
              : is500
              ? "An internal server error occurred. Please try again later."
              : "Could not connect to the server. Please check your connection.")}
        </p>
      </div>
    </div>
  );
}
