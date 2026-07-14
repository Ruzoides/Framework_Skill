      if (sub.status === "active" || sub.status === "trialing") {
        const record = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          include: { user: true },
        });
        if (record?.user.email) {
          await sendReceiptEmail(record.user.email).catch(() => {});
        }
      }
