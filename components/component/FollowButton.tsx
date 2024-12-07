"use client";

import { followAction } from "@/lib/actions";
import { Button } from "../ui/button";
import { useOptimistic } from "react";

interface FollowButtonProps {
  isCurrentUser: boolean;
  userId: string;
  isFollowing: boolean;
}

const FollowButton = ({
  isCurrentUser,
  userId,
  isFollowing,
}: FollowButtonProps) => {
  const [optimistic, addOptimisticFollow] = useOptimistic<
    { isFollowing: boolean },
    void
  >({ isFollowing }, (currentState) => ({
    isFollowing: !currentState.isFollowing,
  }));
  const getButtonContent = () => {
    if (isCurrentUser) {
      return "プロフィール編集";
    }
    if (optimistic.isFollowing) {
      return "フォロー中";
    }
    return "フォローする";
  };

  const getButtonVariant = () => {
    if (isCurrentUser) {
      return "secondary";
    }
    if (optimistic.isFollowing) {
      return "outline";
    }
    return "default";
  };

  const handleFollowAction = async () => {
    if(isCurrentUser) {
      return;
    }

    try {
      addOptimisticFollow();
      await followAction(userId);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <form action={handleFollowAction}>
      <div>
        <Button variant={getButtonVariant()} className="w-full">
          {getButtonContent()}
        </Button>
      </div>
    </form>
  );
};

export default FollowButton;
