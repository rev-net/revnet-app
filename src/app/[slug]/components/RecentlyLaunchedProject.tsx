interface Props {
  createdAt: number;
}

const tenMinutes = 10 * 60;

export function NewProjectNotice(props: Props) {
  const { createdAt } = props;

  const age = Math.floor(Date.now() / 1000) - createdAt;

  if (age > tenMinutes) return null;

  return (
    <div className="col-span-full flex justify-center">
      <div className="bg-orange-100 px-4 py-2.5 rounded-xl max-w-screen-md text-orange-950 text-sm">
        <strong className="font-semibold">Important</strong>
        <span className="font-normal"> &bull; </span> This revnet was recently launched and will be
        fully operational in a few minutes.
      </div>
    </div>
  );
}
