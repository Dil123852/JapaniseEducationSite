import { updateEnrollmentStatus, removeEnrollment, assignStudentToGroup } from './enrollments';
import type { EnrollmentStatus } from './enrollments-types';

export async function blockStudent(
  enrollmentId: string,
  teacherId: string
): Promise<void> {
  await updateEnrollmentStatus(enrollmentId, 'blocked', teacherId);
}

export async function restrictStudent(
  enrollmentId: string,
  teacherId: string
): Promise<void> {
  await updateEnrollmentStatus(enrollmentId, 'restricted', teacherId);
}

export async function reactivateStudent(
  enrollmentId: string,
  teacherId: string
): Promise<void> {
  await updateEnrollmentStatus(enrollmentId, 'active', teacherId);
}

export async function removeStudentFromCourse(enrollmentId: string): Promise<void> {
  await removeEnrollment(enrollmentId);
}

export async function assignToGroup(
  enrollmentId: string,
  groupId: string
): Promise<void> {
  await assignStudentToGroup(enrollmentId, groupId);
}

