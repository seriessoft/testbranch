var admin = require('firebase-admin');

/*
our firebase admin credentials
var serviceAccount = {
  "type": "service_account",
  "project_id": "monopoly-2ffc6",
  "private_key_id": "bff5d6e534c6802ed7e9bc1009a53867c6734835",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCws1ZPBzxqXXsP\ndsFwsyhfwdSYsPP1hAfsR5ToENKzZb5cpLUE6zCCK3RhTnCSHwJy7r7xLw4BfVXK\nfJecv/BDGYv7F1PUPfbyzp2qtQb6pNQwFFWSgiYffymUfE2sJSijbHdvp2Wq5xvr\nF/iyHliSYrO+OFeYX+FsxzNT2rsNUity+4rOJR2ZJl22o7eJ55P6A+fXlN5J0pBO\nQSIuO60r5gfiM1LZz9g1MiDhtO5mKPx5a+Rjur3hlgnVU788fzk0jpFNS3cTGQRj\nhjZiQZ+pkIz7oS9RtqxqbBwo2GdyDlQKRjQExuQ2TuvN2wTTCN8UG8GT5gNccLqZ\nAWGk121dAgMBAAECggEAVO4d8eY8d7NuzsP5vj2ejkgP80Q6Piuz0zGktNZBL9Eb\nalQQXcjdi/NvAMY+/TzCZJO0WyCOztB7R9QS21i2FspUqd9Qf5c49wOwbLiOHjLT\nejiL2NuNj14Dkkcc3j0OB16/GX+QMlDa7mibNKG5WMLwOeHC2I5dP3ePiCJ9/axP\n+Bs7UxS41qZqx6tCaskEWZxYRzZ/7YC5NF/SOYM8rlF9+4a5hAyccEF1xIGVt6q/\nOSFafiepD+kjpZUdvbBvUDDKuAPku/uxDbU75N1tgCLZNeH01QAM8ejshiOBROFp\nKAvKuodvhz4KaAmBQPqMNNjYGDUf16W2Z0xq2f/d0QKBgQDmC1oOHxOJDvNLLG+r\n2Wm509ddE1y2kkfQqsAZEWyPvp0mZ1ORB7CYjSoG2nSXONRjvvcCGlbGMYT/+AKu\n/7Lzk2z00oPgnaRmkgxDKie4CEzuXOAaDG1Xyl5UBL7QUD2zXRVsO0c+/5aSAw4H\nNpmW5gc6c7/KI8cgRBgvQDVhUwKBgQDEozEcmqc/V3Xt++ZFDJ+q3HkM5juK/wWK\npE7zxsf6VpOU4gxqH9TNMFrAvtyF6c7FO5LLVw8QK3LkGcZ0gG3kr4gNeHucT62H\nifkLB8idoRD2F9IQC5w1wl31h5tE8uqutUb+SLeTJmu/p7mz9d2asKfxlJ2G+Vtf\nQa0B1s+wjwKBgQCnMCzdAnziKXlscvkd/j62jV2CCaZiEeIbp11BWsZ5meEAniu/\nxcT0ufOHU5FUrjq923YNkzLpi+fLWGYq5S8bk1OmgrDRuABZg19iGOsQ9wdiXSGK\nDOoS2cLAcUp0fzy4dLgzFsnq4Tp/F7VETMxHPRqXwrPqpyH7M0IYZSPmfQKBgC/4\nb96+i9aUC50HOuHVdo5EQvO2pwf9tuhftTMbZ2XXASHtE4JASbXU+g7TgRDaPSs4\noVMh5fbX4qtq7lM1kZmciOBgaCd1+Kt8KVlbiMGLrYubvA9WBcHHrQxdDLABYudE\nKhGWw9IOKXMUA+W3MVyvhAkXbGalJnlSmFY+hWRZAoGBALnLFEnhx5uJeHOG1fRs\n/BiNon4nL8+fvai2bn6xNjOi7caNRAYcRjmwLw9UK67Z11oiazUGcBCmjwbVAXbH\n/o/J87JROsKlR/byhvZNUifHpiehjdSyPhow6eT3c1lwFM+Q3lP5YRGchT0vWvPZ\nJWEjx7sWuh2rKtwjJAOxF8oI\n-----END PRIVATE KEY-----\n",
  "client_email": "monopoly-2ffc6@appspot.gserviceaccount.com",
  "client_id": "117959006326123857947",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/monopoly-2ffc6%40appspot.gserviceaccount.com"
};
admin.initializeApp({
	credential : admin.credential.cert(serviceAccount),
	databaseURL : "https://monopoly-2ffc6.firebaseio.com"
});
end of our firebase admin credentials
*/
/* Client's firebase admin credentials */
var serviceAccount = {
  "type": "service_account",
  "project_id": "saudideal-922d4",
  "private_key_id": "3878b9cc2eafc748e69b06f688dbd6ad41367425",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDI+5u7JQlr7fBM\nGW9GyuG54j7nbDpzE4wCuhwNXcOfA9RyVqRf19KaWhZ7H3n7bDjY+RJBzOuR6pAP\n/x0XpZbFuf+Suiva6VF+53X4Ov6e+y5gc4p6Im8Mu757GodEJHW9SZYdtLjLayuy\n/xv0PKkR3gF8xcX2qOw642iqFpXe+HYBpOfT/y3tSRRikLfvRnuK4vJn/D3+2lJ/\nVOIKb/mezOYQXIRCzpWwPpKs9iTsRNnvqBoNuaJFbgz9wkJ+peV5Egp1/6WNC/Fe\ntsodxZ/Y0rA8pk4K9hyyWvRmOIwdg/j6FMCAktHRwNc+PjtAETSfeYekCSGNS9Xc\nTopyi7vRAgMBAAECggEBAKSCrzpEWq3pmWPw/dCoiJOqyWqMgFtpiJVC2WtncJRc\ngi0FFo8NDeoiC3zEiwht0Spo1bTek4Rgx4MQgzOz6vH2CWiE0xjhGkASHdIOGBTx\n7Ugtyw+l19hIZOZHFKmGXomODj5Ki2iWVLKzdqI4dPuXCQikqiH4q0SYmDeBPTPA\nHqpd0h3Ko9d/mEjDUCg2i+F1broECYrN0QcNSyQ9cNy5ITjaP4M94zOjZ9npAczw\nrZheivpcReNbqWxIzPOMNoKnfIEzBGThKwdSJe2ThbK4myF+YZD73OctbJxbad1F\ny7iMT4qTBurlgck1ga6b1uXXaLyvIncckvu/avHx8UECgYEA/oDzcjA0382czv2j\nMESdHmupKf2v6NzZTI+6/5Wbfe88nA8bqHLNCHhm55Plj3WCOojE3aWxn4iPrL7/\n76fn56NY0gbC9d4Av/5ES2AB6hAeO+0eDdQwwpQEAmRpYqe0PdEQO9przSJnyxej\nb+1qqahmwl2DYzPqXE0UkPAo/J0CgYEAyioaovVfSRfZZeaZnHTlBA23CvE+K7c0\nho1b6W+AX2LHaIS4csJ8CGj28DFv5Ui0yk784BatqYS4mHFfOkn5yXXoQmBjZAkK\nPSb3GVynHld/TWDqOBXMNwmxirWC2neqKNo4CdZDVsbYGWx0OJYt8578jtpT4zyx\n4tBJ64ehg8UCgYEAxPDQcjpvkAgyIdMQJtfRpaq2GvJe35mW5bILiKAi1Q7+Hd1r\nD6zWkIlrSCSgbaUHA3i2rrX7f3JTi9+5eaC6yfsTTmNBFrWWavu9qX4/vPqACutw\naE8c9FVJzPgavOb9iSBwqYBaD0FihDxkksZr1aGk8x8d/vQ7lPVoxsexT9kCgYBy\nlrjwYzp2OMFt4+5v40YoLQnydtkxeC+akKdnQl82McwrbwcJbTlWnwBRFwSAptxq\ny6jD77bRnjvvlFtQs7uUuHNEpFPR0Nnv3ZUz1/OV3Cx5FJTN43UUQTdUExwvbqKR\nc1dOJBeZKS42AuZBaMZ1D0nCQvhHlhCSKlOr3/3prQKBgQCQYANArRF71BdPQvaq\nUYv1R3Ig5btWceDiUnrdBGoFZOnM2QovPOf1jCjJDv3LMfLY3lrOM0sJFgDt8NV+\nFSUh21F3vH9eHO6GAQ5BtmG3UnDkoiH+vcBEEP+ekPTd9KcWVo7ESCgRI9X1RjXW\nhD7qFpPeWAwu+EnMp9Y/6y6r+Q==\n-----END PRIVATE KEY-----\n",
  "client_email": "node-server@saudideal-922d4.iam.gserviceaccount.com",
  "client_id": "109994877441991953644",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/node-server%40saudideal-922d4.iam.gserviceaccount.com"
};
admin.initializeApp({
	credential : admin.credential.cert(serviceAccount),
	databaseURL : "https://saudideal-922d4.firebaseio.com"
});
/* End of the credentials */


var getUser = function(userId){
	admin.auth().getUser(userId).then(function(userRecord){
		console.log(userRecord);
	});
};

var changePassword = function(userId,newPassword,success,error){
	admin.auth().updateUser(userId,{
		password:newPassword,
		emailVerified:true
	}).then(function(userRecord){
		success(userRecord);
	}).catch(function(err){
		error(err);
	});
};

module.exports = {
	getUser:getUser,
	changePassword:changePassword
};
