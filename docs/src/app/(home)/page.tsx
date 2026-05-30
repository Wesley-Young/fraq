import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/docs');

  /*
  return (
    <div className="flex flex-col justify-center text-center flex-1">
      <h1 className="text-2xl font-bold mb-4">Fraq</h1>
      <p>
        Milky 聊天机器人框架 ｜{' '}
        <Link href="/docs" className="font-medium underline">
          查看文档
        </Link>
      </p>
    </div>
  );
  */
}
