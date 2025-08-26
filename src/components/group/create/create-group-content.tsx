"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateStudyGroupFormData,
  createStudyGroupSchema,
} from "@/lib/schemas/group";
import type { GroupRequest } from "@/types/group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateGroup } from "../../../hooks/group/use-create-group";

export function CreateGroupContent() {
  const router = useRouter();
  const { mutateAsync: createGroup, isPending } = useCreateGroup();

  const form = useForm<CreateStudyGroupFormData>({
    resolver: zodResolver(createStudyGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      memberLimit: 20,
      public: false,
    },
  });

  const onSubmit: SubmitHandler<CreateStudyGroupFormData> = async (values) => {
    try {
      const payload: GroupRequest = {
        name: values.name,
        description: values.description,
        memberLimit: values.memberLimit,
        public: values.public,
      };

      await createGroup(payload);
      toast.success("Tạo nhóm thành công!");
      form.reset();
      router.back();
    } catch (err) {
      toast.error("Có lỗi khi tạo nhóm");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-bold text-3xl text-foreground tracking-tight">
          Create Study Group
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create a new study group to compete and learn with friends.
        </p>
      </div>

      {/* Form Card */}
      <Card className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-md transition-all hover:shadow-lg dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-800">
        <CardHeader className="pb-4">
          <CardTitle className="font-semibold text-2xl">
            Group Details
          </CardTitle>
          <CardDescription>
            Set up your study group with a name, description, and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Group Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Physics Study Squad"
                        {...field}
                        className="rounded-lg border-gray-300 dark:border-zinc-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's your group about?"
                        className="min-h-[100px] rounded-lg border-gray-300 dark:border-zinc-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Member Limit */}
              <FormField
                control={form.control}
                name="memberLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Members</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="20"
                        {...field}
                        className="rounded-lg border-gray-300 dark:border-zinc-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Public Switch */}
              <FormField
                control={form.control}
                name="public"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <div>
                      <FormLabel className="font-medium">
                        Public Group
                      </FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Allow anyone to discover and join your group
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-sm px-6"
                  disabled={isPending}
                >
                  {isPending ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
