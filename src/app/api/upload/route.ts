import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateFolder, uploadFileToDrive } from '@/lib/google';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const academicYear = formData.get('academicYear') as string | null;
    const semester = formData.get('semester') as string | null;
    const learningArea = formData.get('learningArea') as string | null;
    const teacherName = formData.get('teacherName') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!academicYear || !semester || !learningArea || !teacherName) {
      return NextResponse.json(
        { error: 'Missing required metadata parameters' },
        { status: 400 }
      );
    }

    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!parentFolderId) {
      return NextResponse.json(
        { error: 'GOOGLE_DRIVE_FOLDER_ID is not configured on the server' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Get/Create Academic Year Folder (e.g. "2569")
    const yearFolderId = await getOrCreateFolder(academicYear, parentFolderId);

    // 2. Get/Create Semester Folder (e.g. "ภาคเรียนที่ 1")
    const semesterFolderName = `ภาคเรียนที่ ${semester}`;
    const semesterFolderId = await getOrCreateFolder(semesterFolderName, yearFolderId);

    // 3. Get/Create Learning Area Folder (e.g. "วิทยาศาสตร์และเทคโนโลยี")
    const areaFolderId = await getOrCreateFolder(learningArea, semesterFolderId);

    // 4. Get/Create Teacher Folder (e.g. "นายสมชาย ใจดี")
    const teacherFolderId = await getOrCreateFolder(teacherName, areaFolderId);

    // 5. Upload File
    const fileUrl = await uploadFileToDrive(
      file.name,
      file.type || 'application/octet-stream',
      buffer,
      teacherFolderId
    );

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error during upload' },
      { status: 500 }
    );
  }
}
