# Frontend Features

## 1. Authentication & User Management
#### Author: Quang Thang
##### Done: 90%
| Page / Component                  | Route / Path           | Description                        | Status   |
|----------------------------------|------------------------|------------------------------------|----------|
| Register Page                     | `/register`            | Form đăng ký tài khoản             | (Done)   |
| Login Page                        | `/login`               | Form đăng nhập                     | (Done)   |
| Google Login Button               | `/login`               | Đăng nhập bằng Google              | (Done)   |
| Guest Role Selection              | `/choose-role`         | Chọn vai trò Guest/Student/Teacher | (Done)   |
| Logout Handler                    | -                      | Xử lý đăng xuất                    | (Done)   |
| User Profile Page                 | `/users/:id`           | Xem thông tin user                 | (Done)   |
| Edit Profile Form                 | `/users/:id/edit`      | Chỉnh sửa thông tin user           | (Done)   |
| Avatar Upload Component           | `/users/:id/avatar`    | Upload avatar                      | (Done)   |

---

## 2. Group Management
#### Author: Quang Thang
##### Done: 90%
| Page / Component                  | Route / Path                     | Description                          | Status   |
|----------------------------------|-----------------------------------|--------------------------------------|----------|
| Group List (Public Groups)        | `/groups/public`                  | Danh sách nhóm public                | (Done)   |
| My Groups                         | `/groups/my`                      | Danh sách nhóm của user              | (Done)   |
| Group Detail Page                 | `/groups/:id`                     | Chi tiết nhóm                        | (Done)   |
| Create Group Form                 | `/groups/create`                  | Tạo nhóm mới                         | (Done)   |
| Update Group Form                 | `/groups/:id/edit`                | Cập nhật nhóm                        | (Done)   |
| Join Group Button                 | `/groups/:id/join`                | Tham gia nhóm                        | (Done)   |
| Leave Group Button                | `/groups/:id/leave`               | Rời nhóm                             | (Done)   |
| Donate Point Modal                | `/groups/:id/donate`              | Gửi điểm vào nhóm                    | (Done)   |

---

## 3. Chat / Messaging
#### Author: Quang Thang
##### Done: 70%
| Page / Component                  | Route / Path         | Description                        | Status   |
|----------------------------------|----------------------|------------------------------------|----------|
| Chat Room List                    | `/chat/rooms`        | Danh sách phòng chat               | (Done)   |
| Chat Room Detail                  | `/chat/rooms/:id`    | Xem tin nhắn trong room            | (Done)   |
| Send Message Form                 | `/chat/rooms/:id`    | Form gửi tin nhắn                  | (Done)   |

---

## 4. FlashCard
#### Author: Hung Quan
##### Done: 90%
| Page / Component                  | Route / Path              | Description                          | Status   |
|----------------------------------|---------------------------|--------------------------------------|----------|
| Flashcard List (My Sets)          | `/flashcards`             | Danh sách bộ flashcard của user      | (Done)   |
| Flashcard Detail Page             | `/flashcards/:id`         | Xem chi tiết 1 bộ flashcard          | (Done)   |
| Public Flashcard List             | `/flashcards/public`      | Danh sách flashcard public           | (Done)   |
| Create Flashcard Set Form         | `/flashcards/create`      | Tạo bộ flashcard theo type Question  | (Done)   |
| Create Flashcard Set Form         | `/flashcards/create`      | Tạo bộ flashcard theo type Vocabulary (Có âm thanh)| (Done)   |
| Create Flashcard Set Form         | `/flashcards/create`      | Tạo bộ flashcard                     | (Done)   |
| Update Flashcard Set Form         | `/flashcards/:id/edit`    | Chỉnh sửa bộ flashcard               | (Done)   |
| Delete Flashcard Button           | `/flashcards/:id/delete`  | Xóa bộ flashcard                     | (Done)   |

---

## 5. Admin
#### Author: -
##### Done: 0%
| Page / Component | Route / Path | Description | Status |
|------------------|---------------|-------------|--------|
| Admin Dashboard  | `/admin`      | Trang quản trị | (Pending) |

---

## 6. MindMaps
#### Author: Nhat Hao
##### Done: 100%
| Page / Component                  | Route / Path                    | Description                           | Status   |
|----------------------------------|----------------------------------|---------------------------------------|----------|
| MindMap File List                 | `/mindmaps/files`               | Danh sách file mindmap của user       | (Done)   |
| Create MindMap File Form          | `/mindmaps/files/create`        | Tạo file mindmap mới                  | (Done)   |
| Edit MindMap File                 | `/mindmaps/files/:id/edit`      | Chỉnh sửa file mindmap                | (Done)   |
| MindMap File Detail               | `/mindmaps/files/:id`           | Chi tiết file mindmap                 | (Done)   |
| Rename MindMap File               | `/mindmaps/files/:id/rename`    | Đổi tên file mindmap                  | (Done)   |
| Create MindMap                    | `/mindmaps/create`              | Tạo mindmap                           | (Done)   |
| MindMap Detail Page               | `/mindmaps/:id`                 | Xem chi tiết mindmap                  | (Done)   |
| User's MindMaps                   | `/mindmaps/user`                | Danh sách mindmap của user            | (Done)   |
| Update MindMap Page               | `/mindmaps/:id/edit`            | Chỉnh sửa mindmap                     | (Done)   |

---

## 7. Task
#### Author: Cong Bien
##### Done: 100%
| Page / Component       | Route / Path         | Description              | Status   |
|------------------------|----------------------|--------------------------|----------|
| Task List              | `/tasks`             | Danh sách task của user  | (Done)   |
| Task Detail Page       | `/tasks/:id`         | Chi tiết 1 task          | (Done)   |
| Create Task Form       | `/tasks/create`      | Tạo task mới             | (Done)   |
| Update Task Form       | `/tasks/:id/edit`    | Chỉnh sửa task           | (Done)   |
| Delete Task Button     | `/tasks/:id/delete`  | Xóa task                 | (Done)   |

---

## 8. Folder in Group Management
#### Author: Quang Thang
##### Done: 80%
| Page / Component              | Route / Path                               | Description                             | Status   |
|-------------------------------|--------------------------------------------|-----------------------------------------|----------|
| Group Folder List             | `/groups/:groupId/folders`                 | Danh sách folder trong group            | (Done)   |
| Create Folder Form            | `/groups/:groupId/folders/create`          | Tạo folder trong group                  | (Done)   |
| Upload File To Folder         | `/groups/:groupId/folders/:folderId/upload`| Upload file vào folder                  | (Done)   |
| Delete Folder Button          | `/groups/:groupId/folders/:folderId/delete`| Xóa folder trong group                  | (Done)   |
| Delete File From Folder       | `/groups/:groupId/folders/files/:id/delete`| Xóa file trong folder                   | (Done)   |
| Update Folder Form            | `/groups/:groupId/folders/:folderId/edit`  | Chỉnh sửa folder                        | (Done)   |

---

## 9. ContributionHistory
#### Author: Quang Thang
##### Done: 10%
| Page / Component              | Route / Path                            | Description                          | Status   |
|-------------------------------|-----------------------------------------|--------------------------------------|----------|
| Contribution History Page     | `/groups/:groupId/contributions`        | Lịch sử đóng góp trong group         | (Done)   |

---

## 10. Notification
#### Author: -
##### Done: 0%
| Page / Component | Route / Path | Description | Status |
|------------------|--------------|-------------|--------|
| Notification List| `/notifications` | Hiển thị thông báo | (Pending) |

---

## 11. Course Management (Teacher)
#### Author: -
##### Done: 0%
| Page / Component | Route / Path | Description | Status |
|------------------|--------------|-------------|--------|
| Course Dashboard | `/teacher/courses` | Quản lý khóa học | (Pending) |

---

## 12. Achievement
#### Author: -
##### Done: 0%
| Page / Component | Route / Path | Description | Status |
|------------------|--------------|-------------|--------|
| Achievement Page | `/achievements` | Hiển thị thành tích | (Pending) |

---

## 13. Planner
#### Author: -
##### Done: 0%
| Page / Component | Route / Path | Description | Status |
|------------------|--------------|-------------|--------|
| Planner Dashboard| `/planner`   | Lập kế hoạch học tập | (Pending) |

---

## 14. Payment
#### Author: -
##### Done: 0%
| Page / Component | Route / Path | Description | Status |
|------------------|--------------|-------------|--------|
| Payment Page     | `/payment`   | Quản lý thanh toán | (Pending) |

---

## 15. Quizzes
#### Author: Chi Tam
##### Done: 75%
| Page / Component                  | Route / Path                | Description                     | Status   |
|----------------------------------|-----------------------------|---------------------------------|----------|
| Quiz List                        | `/quizzes`                  | Danh sách quiz của user         | (Done)   |
| Quiz Detail Page                 | `/quizzes/:id`              | Xem chi tiết quiz               | (Done)   |
| Public Quiz List                 | `/quizzes/public`           | Danh sách quiz public           | (Done)   |
| Create Quiz Form                 | `/quizzes/create`           | Tạo quiz mới                    | (Done)   |
| Update Quiz Form                 | `/quizzes/:id/edit`         | Chỉnh sửa quiz                  | (Done)   |
| Delete Quiz Button               | `/quizzes/:id/delete`       | Xóa quiz                        | (Done)   |

---

## 16. Pomodoro
#### Author: Hung Quan
##### Done: 90%
| Page / Component | Route / Path | Description | Status |
|------------------|--------------|-------------|--------|
| Pomodoro Timer   | `/pomodoro`  | Hỗ trợ học tập theo Pomodoro | (Done) |
| Pomodoro Timer   | `/pomodoro`  | Hỗ trợ học tập theo Coutdown | (Done) |
| Simple todo   | `/pomodoro`  | Hỗ trợ học tập theo Pomodoro | (Done) |
| Kanban Board  | `/pomodoro`  | Hỗ trợ học tập theo Pomodoro | (Pending) |

---

## 17. Collections
#### Author: -
##### Done: 0%
| Page / Component | Route / Path | Description | Status |
|------------------|--------------|-------------|--------|
| Collections Page | `/collections` | Bộ sưu tập cá nhân | (Pending) |

---

## 18. Materials
#### Author: -
##### Done: 0%
| Page / Component | Route / Path | Description | Status |
|------------------|--------------|-------------|--------|
| Materials Page   | `/materials` | Quản lý tài liệu học tập | (Pending) |
