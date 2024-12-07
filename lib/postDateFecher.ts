import prisma from "./prisma";

const fetchPosts = async (userId: string, username?: string) => {

  //ユーザープロフィール用API
  if (username) {
    return await prisma.post.findMany({
      where: {
        author: {
          username,
        },
      },
      include: {
        author: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  //ホーム画面用一覧API
  if (!username && userId) {
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => {
      return f.followingId;
    });
    const ids = [userId, ...followingIds];

    return await prisma.post.findMany({
      where: {
        authorId: {
          in: ids,
        },
      },
      include: {
        author: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
};

export { fetchPosts };
