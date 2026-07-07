'use server';

import crypto from 'crypto';
import { getSheetData, appendRow, updateRow, deleteRow } from './google';
import { getAdminSession } from './auth';

// --- AUTH CHECK HELPER ---
async function verifyAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized: Admin access required.');
  }
}

// --- CONFIG ACTIONS ---
export async function getActiveConfig() {
  try {
    const data = await getSheetData<{ Key: string; Value: string }>('Config');
    const configMap = Object.fromEntries(data.map((c) => [c.Key, c.Value]));
    return {
      activeYear: configMap['active_year'] || (new Date().getFullYear() + 543).toString(),
      activeSemester: configMap['active_semester'] || '1',
    };
  } catch (err) {
    console.error('Error in getActiveConfig:', err);
    return {
      activeYear: (new Date().getFullYear() + 543).toString(),
      activeSemester: '1',
    };
  }
}

export async function setActiveConfig(year: string, semester: string) {
  await verifyAdmin();
  const data = await getSheetData<{ Key: string; Value: string; _rowIndex: number }>('Config');
  
  const yearConfig = data.find((c) => c.Key === 'active_year');
  if (yearConfig) {
    await updateRow('Config', yearConfig._rowIndex, { Key: 'active_year', Value: year });
  } else {
    await appendRow('Config', { Key: 'active_year', Value: year });
  }

  const semesterConfig = data.find((c) => c.Key === 'active_semester');
  if (semesterConfig) {
    await updateRow('Config', semesterConfig._rowIndex, { Key: 'active_semester', Value: semester });
  } else {
    await appendRow('Config', { Key: 'active_semester', Value: semester });
  }
}

// --- LEARNING AREA ACTIONS ---
export interface LearningArea {
  _rowIndex: number;
  Id: string;
  Name: string;
}

export async function getLearningAreas(): Promise<LearningArea[]> {
  return getSheetData<LearningArea>('LearningAreas');
}

export async function createLearningArea(name: string) {
  await verifyAdmin();
  const id = crypto.randomUUID().slice(0, 8);
  await appendRow('LearningAreas', { Id: id, Name: name });
}

export async function updateLearningArea(rowIndex: number, id: string, name: string) {
  await verifyAdmin();
  await updateRow('LearningAreas', rowIndex, { Id: id, Name: name });
}

export async function deleteLearningArea(rowIndex: number) {
  await verifyAdmin();
  await deleteRow('LearningAreas', rowIndex);
}

// --- CATEGORY ACTIONS ---
export interface Category {
  _rowIndex: number;
  Id: string;
  Name: string;
  Description: string;
}

export async function getCategories(): Promise<Category[]> {
  return getSheetData<Category>('Categories');
}

export async function createCategory(name: string, description: string) {
  await verifyAdmin();
  const id = crypto.randomUUID().slice(0, 8);
  await appendRow('Categories', { Id: id, Name: name, Description: description });
}

export async function updateCategory(rowIndex: number, id: string, name: string, description: string) {
  await verifyAdmin();
  await updateRow('Categories', rowIndex, { Id: id, Name: name, Description: description });
}

export async function deleteCategory(rowIndex: number) {
  await verifyAdmin();
  await deleteRow('Categories', rowIndex);
}

// --- TEACHER ACTIONS ---
export interface Teacher {
  _rowIndex: number;
  Id: string;
  Prefix: string;
  FirstName: string;
  LastName: string;
  LearningAreaId: string;
  Status: string;
}

export async function getTeachers(): Promise<Teacher[]> {
  return getSheetData<Teacher>('Teachers');
}

export async function createTeacher(prefix: string, firstName: string, lastName: string, learningAreaId: string) {
  await verifyAdmin();
  const id = crypto.randomUUID().slice(0, 8);
  await appendRow('Teachers', {
    Id: id,
    Prefix: prefix,
    FirstName: firstName,
    LastName: lastName,
    LearningAreaId: learningAreaId,
    Status: 'active',
  });
}

export async function updateTeacher(
  rowIndex: number,
  id: string,
  prefix: string,
  firstName: string,
  lastName: string,
  learningAreaId: string,
  status: string
) {
  await verifyAdmin();
  await updateRow('Teachers', rowIndex, {
    Id: id,
    Prefix: prefix,
    FirstName: firstName,
    LastName: lastName,
    LearningAreaId: learningAreaId,
    Status: status,
  });
}

export async function deleteTeacher(rowIndex: number) {
  await verifyAdmin();
  await deleteRow('Teachers', rowIndex);
}

// --- MEDIA ACTIONS ---
export interface MediaItem {
  _rowIndex: number;
  Id: string;
  Timestamp: string;
  AcademicYear: string;
  Semester: string;
  TeacherId: string;
  TeacherName: string;
  LearningAreaName: string;
  CategoryId: string;
  CategoryName: string;
  Title: string;
  Description: string;
  Type: 'link' | 'file';
  Url: string;
}

export async function getMedia(): Promise<MediaItem[]> {
  return getSheetData<MediaItem>('Media');
}

export async function createMedia(
  teacherId: string,
  categoryId: string,
  title: string,
  description: string,
  type: 'link' | 'file',
  url: string
) {
  // Public action (no admin verification needed)
  const config = await getActiveConfig();
  const teachers = await getTeachers();
  const categories = await getCategories();
  const areas = await getLearningAreas();

  const teacher = teachers.find((t) => t.Id === teacherId);
  const category = categories.find((c) => c.Id === categoryId);
  if (!teacher) throw new Error('Teacher not found');
  if (!category) throw new Error('Category not found');

  const area = areas.find((a) => a.Id === teacher.LearningAreaId);
  const areaName = area ? area.Name : 'ไม่ระบุ';
  const teacherFullName = `${teacher.Prefix}${teacher.FirstName} ${teacher.LastName}`;

  const mediaId = crypto.randomUUID().slice(0, 8);
  const timestamp = new Date().toISOString();

  await appendRow('Media', {
    Id: mediaId,
    Timestamp: timestamp,
    AcademicYear: config.activeYear,
    Semester: config.activeSemester,
    TeacherId: teacherId,
    TeacherName: teacherFullName,
    LearningAreaName: areaName,
    CategoryId: categoryId,
    CategoryName: category.Name,
    Title: title,
    Description: description,
    Type: type,
    Url: url,
  });
}

export async function deleteMedia(rowIndex: number) {
  await verifyAdmin();
  await deleteRow('Media', rowIndex);
}

// --- USAGE REPORT ACTIONS ---
export interface UsageReport {
  _rowIndex: number;
  Id: string;
  Timestamp: string;
  AcademicYear: string;
  Semester: string;
  TeacherId: string;
  TeacherName: string;
  MediaId: string;
  MediaTitle: string;
  UsageDate: string;
  TargetClass: string;
  StudentCount: string;
  OutcomeProblems: string;
}

export async function getUsageReports(): Promise<UsageReport[]> {
  return getSheetData<UsageReport>('UsageReports');
}

export async function createUsageReport(
  teacherId: string,
  mediaId: string,
  usageDate: string,
  targetClass: string,
  studentCount: number,
  outcomeProblems: string
) {
  // Public action
  const config = await getActiveConfig();
  const teachers = await getTeachers();
  const mediaList = await getMedia();

  const teacher = teachers.find((t) => t.Id === teacherId);
  const media = mediaList.find((m) => m.Id === mediaId);

  if (!teacher) throw new Error('Teacher not found');
  if (!media) throw new Error('Media not found');

  const teacherFullName = `${teacher.Prefix}${teacher.FirstName} ${teacher.LastName}`;
  const reportId = crypto.randomUUID().slice(0, 8);
  const timestamp = new Date().toISOString();

  await appendRow('UsageReports', {
    Id: reportId,
    Timestamp: timestamp,
    AcademicYear: config.activeYear,
    Semester: config.activeSemester,
    TeacherId: teacherId,
    TeacherName: teacherFullName,
    MediaId: mediaId,
    MediaTitle: media.Title,
    UsageDate: usageDate,
    TargetClass: targetClass,
    StudentCount: studentCount,
    OutcomeProblems: outcomeProblems,
  });
}

export async function deleteUsageReport(rowIndex: number) {
  await verifyAdmin();
  await deleteRow('UsageReports', rowIndex);
}
