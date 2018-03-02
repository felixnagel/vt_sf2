<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use LuckyNail\SimpleForms\Form;
use AppBundle\Entity;

class SignupController extends Controller{
	/**
     * @Route("/signup", name="signup")
     */
    public function signupAction(){
        $oForm = new Form([
        	'id' => 'signup',
        	'whitelist' => [
                'username',
                'pw',
                'pw2',
            ],
        	'validators' => [
                'username' => ['required', 'email'],
                'pw' => ['required'],
                'pw2' => ['required', 'eq' => '~{pw}~'],
        	],
        ]);
        $oForm->fetch_data();

        if($oForm->is_submitted()){
            $aSignupData = $oForm->get_raw_form_data();

            $repository = $this->getDoctrine()->getRepository('AppBundle:Users');

            $oDoublet = $repository->findOneByUsername($aSignupData['username']);

            if($oDoublet){
                $oForm->add_validators([
                    'username' => ['!eq' => $oDoublet->getUsername()],
                ]);
            }

            if($oForm->is_valid()){
                $oUser = new Entity\Users();

                $encoder = $this->container->get('security.password_encoder');
                $encoded = $encoder->encodePassword($oUser, $aSignupData['pw']);

                $oUser->setUsername($aSignupData['username']);
                $oUser->setCreatedAt(date("Y-m-d H:i:s"));
                $oUser->setUpdatedAt(date("Y-m-d H:i:s"));
                $oUser->setRole('ROLE_PLAYER');
                $oUser->setPassword($encoded);


                $em = $this->getDoctrine()->getManager();
                $em->persist($oUser);
                $em->flush();
                
                return $this->redirectToRoute('login');
            }else{
                dump($oForm->get_errors());
            } 
        }
        
        return $this->render('default/signup.html.twig', ['oForm' => $oForm]);
    }
}
