import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { appOperation } from "../../../../appOperation";
import { getProfile } from "../../../../actions/authActions";
import { toastAlert } from "../../../../actions/UploadImageActions";

/** The user's selected turn-ons: optimistic toggle, saved to the backend, reverted if that fails. */
export function useTurnOnSelection(userTurnOns: any[] | undefined, isFocused: boolean) {
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState<any[]>([]);

  useEffect(() => {
    if (userTurnOns) {
      setSelectedIds(userTurnOns.map((turnOn: any) => turnOn._id || turnOn.id));
    }
  }, [userTurnOns, isFocused]);

  const toggle = async (id: any) => {
    const previous = selectedIds;
    const next = previous.includes(id) ? previous.filter((item: any) => item !== id) : [...previous, id];
    setSelectedIds(next);

    try {
      const response: any = await appOperation.customer.editProfileAPI({ attributes: next });
      if (response?.statusCode == 200) {
        dispatch(getProfile(true) as any);
      } else {
        setSelectedIds(previous);
        toastAlert.showToastError(response?.message || "Something went wrong!");
      }
    } catch (e) {
      setSelectedIds(previous);
      toastAlert.showToastError("Failed to update turn ons");
    }
  };

  return { selectedIds, toggle };
}
