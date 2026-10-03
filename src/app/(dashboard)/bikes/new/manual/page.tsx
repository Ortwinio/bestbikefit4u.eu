import { CreateBikeForm } from "@/components/features/bikes/CreateBikeForm";
import { BikeCreationAccess } from "@/components/bikes/BikeCreationAccess";

export default function NewManualBikePage() {
  return <BikeCreationAccess><CreateBikeForm /></BikeCreationAccess>;
}
