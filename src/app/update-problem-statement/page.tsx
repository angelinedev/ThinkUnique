import UpdateProblemStatementForm from '@/components/update-problem-statement-form';

export const metadata = {
  title: 'Update Problem Statement | ThinkUnique',
  description: 'Update your registered team\'s problem statement for the ThinkUnique hackathon.',
};

export default function UpdateProblemStatementPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          Update Problem Statement
        </h1>
        <p className="text-lg text-blue-100/80 mb-8 max-w-2xl mx-auto">
          If you registered your team before the official problem statements were released, 
          you can select your final problem statement here using your Team ID.
        </p>
      </div>

      <UpdateProblemStatementForm />
    </div>
  );
}
