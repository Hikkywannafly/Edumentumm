"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getLocaleFromPathname } from "@/lib/utils";
import type { Course } from "@/types/course.type";
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LocalizedLink } from "../../localized-link";

interface TeacherCourseTableProps {
  courses: Course[];
}

export function TeacherCourseTable({ courses }: TeacherCourseTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { toast } = useToast();

  const getLevelText = (level: string) => {
    switch (level) {
      case "basic":
        return "Cơ bản";
      case "intermediate":
        return "Trung bình";
      case "advanced":
        return "Nâng cao";
      default:
        return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "basic":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "Bản nháp";
      case "published":
        return "Đã xuất bản";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "published":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (courseToDelete) {
      // TODO: Implement actual delete functionality
      toast({
        title: "Khóa học đã được xóa",
        description: `Khóa học "${courseToDelete.title}" đã được xóa thành công.`,
      });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleDuplicate = (course: Course) => {
    // TODO: Implement duplicate functionality
    toast({
      title: "Khóa học đã được sao chép",
      description: `Khóa học "${course.title}" đã được sao chép thành công.`,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
        <div className="mb-4 h-16 w-16 text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            <path d="M12 2v20" strokeDasharray="2 2" />
          </svg>
        </div>
        <h3 className="mb-2 font-medium text-foreground text-lg">
          Chưa có khóa học nào
        </h3>
        <p className="mb-4 text-muted-foreground">
          Bắt đầu tạo khóa học đầu tiên của bạn
        </p>
        <LocalizedLink href={`/${locale}/course/teacher/new`}>
          <Button>Tạo khóa học mới</Button>
        </LocalizedLink>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khóa học</TableHead>
              <TableHead>Cấp độ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Bài học</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{course.title}</div>
                      <div className="truncate text-muted-foreground text-sm">
                        {course.shortDescription}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {course.topics.slice(0, 2).map((topic) => (
                          <Badge
                            key={topic}
                            variant="secondary"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                        {course.topics.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{course.topics.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getLevelColor(course.level)}>
                    {getLevelText(course.level)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(course.status)}>
                    {getStatusText(course.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {course.lessonsCount || 0} bài
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(course.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(course.updatedAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/${locale}/course/teacher/${course.id}`}>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        href={`/${locale}/course/teacher/${course.id}/edit`}
                      >
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => handleDuplicate(course)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Sao chép
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(course)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khóa học "{courseToDelete?.title}"? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
