import { Suspense } from "react";
import EditTaskPage from "./EditTaskPage";

export default function Page() {
  return (
    <Suspense>
      <EditTaskPage />
    </Suspense>
  );
}
