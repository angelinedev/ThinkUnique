'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { lookupTeamAction, updateProblemStatementAction } from '@/app/update-problem-statement/actions';
import ProblemStatementsList from '@/components/problem-statements-list';
import { problemStatements } from '@/app/problem-statements/data';
import type { ProblemStatement } from '@/types';

export default function UpdateProblemStatementForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submissionId, setSubmissionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [teamInfo, setTeamInfo] = useState<{
    teamName: string;
    edition: string;
    problemStatementId: string;
    problemStatementTitle: string;
  } | null>(null);

  const [selectedStatement, setSelectedStatement] = useState<ProblemStatement | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId.trim()) {
      setError('Please enter a valid Team ID.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await lookupTeamAction(submissionId);

    if (result.success && result.team) {
      setTeamInfo(result.team as any); // Cast based on our action return type
      setStep(2);
    } else {
      setError(result.message || 'Team ID not found.');
    }
    
    setLoading(false);
  };

  const handleSelectStatement = (statement: ProblemStatement) => {
    setSelectedStatement(statement);
    // You could optionally show a confirmation dialog here before updating
    handleUpdate(statement);
  };

  const handleUpdate = async (statement: ProblemStatement) => {
    if (!teamInfo) return;

    setLoading(true);
    setError(null);

    const result = await updateProblemStatementAction(
      submissionId,
      statement.id,
      statement.title
    );

    if (result.success) {
      setStep(3);
    } else {
      setError(result.message || 'Failed to update problem statement.');
      setStep(2); // Stay on step 2 if update fails
    }

    setLoading(false);
  };

  // Filter statements based on the team's edition
  const availableStatements = problemStatements.filter(
    (ps) => ps.category === teamInfo?.edition
  );

  return (
    <div className="max-w-4xl mx-auto">
      {step === 1 && (
        <Card className="bg-blue-900/[0.05] border-blue-500/20 backdrop-blur-sm max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-100">Update Problem Statement</CardTitle>
            <CardDescription className="text-blue-200/70">
              Enter your Team ID to select your final problem statement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="e.g., TQ-1234567890"
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                  disabled={loading}
                  className="bg-blue-950/50 border-blue-500/30 text-blue-50 placeholder:text-blue-200/50"
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Lookup Team
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && teamInfo && (
        <div className="space-y-8">
          <Card className="bg-blue-900/[0.05] border-blue-500/20 backdrop-blur-sm">
             <CardHeader>
               <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-blue-100 mb-2">Team Found: {teamInfo.teamName}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="border-blue-500/30 text-blue-200">
                        {teamInfo.edition} Track
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-100">
                        ID: {submissionId}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-blue-300 hover:text-blue-100">
                     Change Team ID
                  </Button>
               </div>
             </CardHeader>
             <CardContent>
               <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-500/10">
                 <p className="text-sm text-blue-200/70 mb-1">Current Problem Statement:</p>
                 <p className="text-blue-50 font-medium">
                   <span className="text-blue-300 mr-2">{teamInfo.problemStatementId}</span>
                   {teamInfo.problemStatementTitle}
                 </p>
               </div>
               
               {error && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
             </CardContent>
          </Card>

          <div>
             <h3 className="text-xl font-headline text-white/90 mb-4 text-center">Select New Problem Statement</h3>
             <p className="text-center text-muted-foreground mb-8">
               Showing statements for the {teamInfo.edition} track. Please select your final problem statement below.
             </p>
             {loading ? (
                <div className="flex justify-center py-12">
                   <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
             ) : (
                <ProblemStatementsList 
                  statements={availableStatements} 
                  mode="select" 
                  onSelect={handleSelectStatement} 
                />
             )}
          </div>
        </div>
      )}

      {step === 3 && teamInfo && selectedStatement && (
        <Card className="bg-green-900/[0.05] border-green-500/20 backdrop-blur-sm max-w-lg mx-auto text-center py-8">
          <CardHeader>
            <div className="mx-auto bg-green-500/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-100">Update Successful!</CardTitle>
            <CardDescription className="text-green-200/70 text-base mt-2">
              Problem statement updated for team <strong>{teamInfo.teamName}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-950/30 p-4 rounded-lg border border-green-500/10 text-left">
              <p className="text-sm text-green-200/70 mb-1">New Problem Statement:</p>
              <p className="text-green-50 font-medium">
                <span className="text-green-300 mr-2">{selectedStatement.id}</span>
                {selectedStatement.title}
              </p>
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
               <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                 <Link href="/">Return to Home</Link>
               </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
