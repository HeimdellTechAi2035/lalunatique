import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Cancellation Rights" };

export default function CancellationPage() {
  return (
    <LegalPageLayout title="Cancellation Rights" lastUpdated="25 August 2026">
      <p>
        Under the Consumer Contracts Regulations 2013, you have the right to cancel your order within 14 days of
        receiving your goods, without giving a reason.
      </p>

      <h2>How to cancel</h2>
      <p>
        Contact us before the 14-day period ends to let us know you wish to cancel. You then have a further 14
        days to return the goods.
      </p>

      <h2>Exceptions</h2>
      <p>
        This right does not apply to sealed goods which are not suitable for return due to health or hygiene
        reasons if unsealed after delivery, such as opened tanning or skincare products.
      </p>

      <h2>Refunds after cancellation</h2>
      <p>
        We&apos;ll refund your payment, including standard delivery costs, within 14 days of receiving the returned
        goods or evidence you&apos;ve sent them back.
      </p>
    </LegalPageLayout>
  );
}
