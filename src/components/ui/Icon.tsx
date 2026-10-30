import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faFileCircleCheck,
  faPlane,
  faShip,
  faTruckFast,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import type { IconName } from "@/types";

const icons = {
  truck: faTruckFast,
  ship: faShip,
  plane: faPlane,
  "file-check": faFileCircleCheck,
  warehouse: faWarehouse,
  "chart-line": faChartLine,
} satisfies Record<IconName, FontAwesomeIconProps["icon"]>;

/** Service icon (Font Awesome). Size it with a font-size class, e.g. `text-lg`. */
export function Icon({ name, ...props }: { name: IconName } & Omit<FontAwesomeIconProps, "icon">) {
  return <FontAwesomeIcon icon={icons[name]} aria-hidden {...props} />;
}
