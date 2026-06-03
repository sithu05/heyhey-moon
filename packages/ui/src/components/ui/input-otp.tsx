"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";

import { cn } from "../../lib/utils";
import { MinusIcon } from "lucide-react";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "ui:cn-input-otp ui:flex ui:items-center ui:has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("ui:disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "ui:flex ui:items-center ui:rounded-lg ui:has-aria-invalid:border-destructive ui:has-aria-invalid:ring-3 ui:has-aria-invalid:ring-destructive/20 ui:dark:has-aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "ui:relative ui:flex ui:size-8 ui:items-center ui:justify-center ui:border-y ui:border-r ui:border-input ui:text-sm ui:transition-all ui:outline-none ui:first:rounded-l-lg ui:first:border-l ui:last:rounded-r-lg ui:aria-invalid:border-destructive ui:data-[active=true]:z-10 ui:data-[active=true]:border-ring ui:data-[active=true]:ring-3 ui:data-[active=true]:ring-ring/50 ui:data-[active=true]:aria-invalid:border-destructive ui:data-[active=true]:aria-invalid:ring-destructive/20 ui:dark:bg-input/30 ui:dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="ui:pointer-events-none ui:absolute ui:inset-0 ui:flex ui:items-center ui:justify-center">
          <div className="ui:h-4 ui:w-px ui:animate-caret-blink ui:bg-foreground ui:duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="ui:flex ui:items-center ui:[&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
