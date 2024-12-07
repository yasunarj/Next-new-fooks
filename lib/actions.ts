"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

interface State {
  error: string | undefined;
  success: boolean;
}

const addPostAction = async (
  prevState: State,
  formData: FormData
): Promise<State> => {
  try {
    const { userId } = auth();

    if (!userId) {
      return { error: "ユーザーが存在しません", success: false };
    }
    const postText = formData.get("post") as string;
    if (!postText) {
      return { error: "投稿内容が空です", success: false };
    }
    const postTextSchema = z
      .string()
      .min(1, "投稿を入力してください")
      .max(140, "140文字以内で入力してください");

    const validatedPostText = postTextSchema.parse(postText);
    await prisma.post.create({
      data: {
        content: validatedPostText,
        authorId: userId,
      },
    });

    revalidatePath("/");

    return { error: undefined, success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors.map((e) => e.message).join(", "),
        success: false,
      };
    } else if (error instanceof Error) {
      return {
        error: error.message,
        success: false,
      };
    } else {
      return {
        error: "予期せぬエラーが発生しました",
        success: false,
      };
    }
  }
};

const likeAction = async (postId: string) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });
    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
    }
    revalidatePath("/");
  } catch (e) {
    console.log(e);
  }
};

const followAction = async (userId: string) => {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    throw new Error("User is not authenticated!");
  }
  try {
    //unfollow
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      }
    });
    if(existingFollow) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          }
        }
      })
    } else {
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: userId,
        }
      });
    }
    revalidatePath(`profile/${userId}`);
  } catch (e) {
    console.log(e);
  }
};

export { addPostAction, likeAction, followAction };
