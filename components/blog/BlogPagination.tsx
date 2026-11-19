import Link from "next/link";

type BlogPaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
};

function hrefFor(basePath: string, page: number) {
  if (page <= 1) return basePath;
  const join = basePath.includes("?") ? "&" : "?";
  return `${basePath}${join}page=${page}`;
}

export default function BlogPagination({
  page,
  totalPages,
  basePath,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="blog-pager" aria-label="Blog pagination">
      {prev ? (
        <Link href={hrefFor(basePath, prev)} rel="prev">
          Prev
        </Link>
      ) : (
        <span className="is-disabled">Prev</span>
      )}
      {pages.map((n) =>
        n === page ? (
          <span key={n} className="is-current" aria-current="page">
            {n}
          </span>
        ) : (
          <Link key={n} href={hrefFor(basePath, n)}>
            {n}
          </Link>
        )
      )}
      {next ? (
        <Link href={hrefFor(basePath, next)} rel="next">
          Next
        </Link>
      ) : (
        <span className="is-disabled">Next</span>
      )}
    </nav>
  );
}
