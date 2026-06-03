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
        "ui-cn-input-otp ui-flex ui-items-center has-disabled:ui-opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("disabled:ui-cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "ui-flex ui-items-center ui-rounded-lg has-aria-invalid:ui-border-destructive has-aria-invalid:ui-ring-3 has-aria-invalid:ui-ring-destructive/20 dark:has-aria-invalid:ui-ring-destructive/40",
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
        "ui-relative ui-flex ui-size-8 ui-items-center ui-justify-center ui-border-y ui-border-r ui-border-input ui-text-sm ui-transition-all ui-outline-none first:ui-rounded-l-lg first:ui-border-l last:ui-rounded-r-lg aria-invalid:ui-border-destructive data-[active=true]:ui-z-10 data-[active=true]:ui-border-ring data-[active=true]:ui-ring-3 data-[active=true]:ui-ring-ring/50 data-[active=true]:aria-invalid:ui-border-destructive data-[active=true]:aria-invalid:ui-ring-destructive/20 dark:ui-bg-input/30 dark:data-[active=true]:aria-invalid:ui-ring-destructive/40",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="ui-pointer-events-none ui-absolute ui-inset-0 ui-flex ui-items-center ui-justify-center">
          <div className="ui-h-4 ui-w-px ui-animate-caret-blink ui-bg-foreground ui-duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="ui-flex ui-items-center [&_svg:not([class*='size-'])]:ui-size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
