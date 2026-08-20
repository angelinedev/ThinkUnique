'use server';

import { z } from 'zod';
import { findTeamBySubmissionId, updateProblemStatementInSheet } from '@/services/google-sheets';

export async function lookupTeamAction(submissionId: string) {
  try {
    const parsedId = z.string().min(1, 'Team ID is required').parse(submissionId);
    const team = await findTeamBySubmissionId(parsedId);
    
    if (!team) {
      return { success: false, message: 'Team ID not found. Please check and try again.' };
    }

    return { 
      success: true, 
      team: {
        teamName: team.teamName,
        edition: team.edition,
        problemStatementId: team.problemStatementId,
        problemStatementTitle: team.problemStatementTitle,
      } 
    };
  } catch (error) {
    console.error('Error looking up team:', error);
    if (error instanceof z.ZodError) {
       return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: 'An error occurred while looking up the team.' };
  }
}

export async function updateProblemStatementAction(
  submissionId: string,
  problemStatementId: string,
  problemStatementTitle: string
) {
  try {
    const parsedSubmissionId = z.string().min(1, 'Team ID is required').parse(submissionId);
    const parsedProblemId = z.string().min(1, 'Problem Statement ID is required').parse(problemStatementId);
    const parsedProblemTitle = z.string().min(1, 'Problem Statement Title is required').parse(problemStatementTitle);

    const result = await updateProblemStatementInSheet(parsedSubmissionId, parsedProblemId, parsedProblemTitle);

    if (!result.success) {
      return { success: false, message: result.error || 'Failed to update problem statement.' };
    }

    return { success: true, message: 'Problem statement updated successfully.' };
  } catch (error) {
    console.error('Error updating problem statement:', error);
    if (error instanceof z.ZodError) {
        return { success: false, message: error.errors[0].message };
     }
    return { success: false, message: 'An error occurred while updating the problem statement.' };
  }
}
