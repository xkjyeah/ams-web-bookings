{
  "rules": {
    "users": {
      ".read": "true",
      ".indexOn": ["email"],
    },
    "userDefaults": {
      "$uid": {
        ".read": "auth.uid == $uid",
        ".write": "auth.uid == $uid",
      }
    },
    "drivers": {
      ".read": "true",
    },
    "admins": {
      ".read": "auth.token.email_verified == true && (
                  root.child('admins')
                  .child(auth.token.email.replace('.', '%2e'))
                  .val() == 1)",
    },
    "bookings": {
      ".read": "auth.token.email_verified == true && (
            root.child('admins')
            .child(auth.token.email.replace('.', '%2e'))
            .val() == 1)",
      ".indexOn": ["pickupTime", "createdAt", "contactEmail"],
      "$key": {
        ".read": "
            auth.token.email_verified == true && (
            root.child('admins')
            .child(auth.token.email.replace('.', '%2e'))
            .val() == 1 ||
            auth.token.email == data.child('contactEmail').val())",
        ".write": "
            auth.token.email_verified == true && (
            root.child('admins')
            .child(auth.token.email.replace('.', '%2e'))
            .val() == 1 ||
            (
              auth.token.email == newData.child('contactEmail').val() &&
              (
                auth.token.email == data.child('contactEmail').val() ||
                null == data.child('contactEmail').val()
              )
            ))
        ",
      }
    },
    "cancellations": {
      ".read": "auth.token.email_verified == true && (
            root.child('admins')
            .child(auth.token.email.replace('.', '%2e'))
            .val() == 1)",
      ".indexOn": ["pickupTime", "createdAt", "contactEmail"],
      "$key": {
        ".read": "
            auth.token.email_verified == true && (
            root.child('admins')
            .child(auth.token.email.replace('.', '%2e'))
            .val() == 1 ||
            auth.token.email == root.child('bookings').child($key).child('contactEmail').val())",
        ".write": "
            auth.token.email_verified == true && (
            root.child('admins')
            .child(auth.token.email.replace('.', '%2e'))
            .val() == 1 ||
            auth.token.email == root.child('bookings').child($key).child('contactEmail').val())
        ",
        ".indexOn": ["createdAt"]
      }
    },
    "userBookings":  {
      "$uid": {
        ".read": "auth.uid == $uid",
        ".write": "auth.uid == $uid",
        ".indexOn": ["createdAt", "pickupTime"]
      }
    },
  },
}